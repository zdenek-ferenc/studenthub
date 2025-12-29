import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { rating, message, userId, userEmail } = body;

        if (!rating && !message) {
            return NextResponse.json({ error: 'Chybí hodnocení nebo zpráva' }, { status: 400 });
        }
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID_FEEDBACK;

        if (!spreadsheetId) {
            throw new Error('Chybí GOOGLE_SHEET_ID_FEEDBACK v .env');
        }

        const date = new Date().toLocaleString('cs-CZ');
        
        const rowData = [
            date,
            userId || 'Anonymous',
            userEmail || 'Nezadáno',
            rating || '-', 
            message || '-' 
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'A1', 
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [rowData],
            },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Chyba při zápisu feedbacku do Google Sheet:', error);
        return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 });
    }
}