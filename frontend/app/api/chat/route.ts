import { NextRequest, NextResponse } from 'next/server';

interface ContentPart {
    text?: string;
    [key: string]: any;
}

interface EventContent {
    parts?: ContentPart[];
    [key: string]: any;
}

interface StateDeltaMessage {
    content?: EventContent;
    [key: string]: any;
}

interface StateDelta {
    messages?: StateDeltaMessage[];
    [key: string]: any;
}

interface AgentEvent {
    content?: EventContent;
    state_delta?: StateDelta;
    [key: string]: any;
}

interface ChatRequestBody {
    prompt: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: ChatRequestBody = await req.json();
        const { prompt } = body;

        const BACKEND_URL = 'https://adk-default-service-name-300414757844.us-east4.run.app';
        const APP_NAME = 'adk-google-agent-multi-tools';
        const USER_ID = 'web-user';
        const SESSION_ID = 'web-session-001'; // In prod, generate unique ID per user

        console.log(`[API] Processing request for: ${prompt}`);

        // 1. Ensure Session Exists
        const sessionUrl = `${BACKEND_URL}/apps/${APP_NAME}/users/${USER_ID}/sessions/${SESSION_ID}`;
        try {
            const sessionRes = await fetch(sessionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (sessionRes.ok) {
                console.log('[API] Session created/verified');
            } else {
                console.log('[API] Session creation status:', sessionRes.status);
                // 409 means already exists usually, or we just ignore if it fails expecting 200
            }
        } catch (e) {
            console.error('[API] Error creating session:', e);
        }

        // 2. Run Agent
        // Payload must match RunAgentRequest structure
        const runPayload = {
            app_name: APP_NAME,
            user_id: USER_ID,
            session_id: SESSION_ID,
            new_message: {
                parts: [{ text: prompt }],
                role: "user"
            }
        };

        const runRes = await fetch(`${BACKEND_URL}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(runPayload),
        });

        if (!runRes.ok) {
            const errorText = await runRes.text();
            console.error('[API] /run failed:', runRes.status, errorText);
            return NextResponse.json(
                { error: `Backend run failed: ${runRes.status} ${errorText}` },
                { status: runRes.status }
            );
        }

        const events: AgentEvent[] = await runRes.json();
        console.log('[API] Received events:', events.length);

        // Process events to find the text response
        // ADK returns a list of events. We want the one with 'text' or 'part'
        let textResponse = '';
        // Reverse order to get final response
        for (const event of events.slice().reverse()) {
            // Check for direct content parts (common for response_formatter)
            if (event.content && event.content.parts) {
                for (const part of event.content.parts) {
                    if (part.text) {
                        textResponse = part.text;
                        break;
                    }
                }
                if (textResponse) break;
            }

            // Look for model response in state_delta (fallback)
            if (event.state_delta?.messages) {
                // Check the last message in the delta
                const lastMsg = event.state_delta.messages[0]; // usually delta contains the new message
                if (lastMsg && lastMsg.content && lastMsg.content.parts) {
                    textResponse = lastMsg.content.parts.map((p) => p.text).join('');
                    if (textResponse) break;
                }
            }
        }

        // Fallback if structure is different (common in ADK versions)
        if (!textResponse && events.length > 0) {
            // Just verify headers or look for specific event types
            textResponse = "Response received but could not parse text. Check logs.";
        }

        return NextResponse.json({ text: textResponse, events: events });

    } catch (error: any) {
        console.error('[API] Internal Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
