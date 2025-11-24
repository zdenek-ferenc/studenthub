import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, userName, suggestion, type } = body;

        // Validace
        if (!userId || !suggestion || !type) {
            return NextResponse.json({ error: 'Chybí povinné údaje' }, { status: 400 });
        }

        // 1. Přihlášení do Googlu
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                // Oprava formátování klíče (převede \n na skutečné odřádkování)
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 2. Výběr správné tabulky podle typu
        const spreadsheetId = type === 'skill' 
            ? process.env.GOOGLE_SHEET_ID_SKILLS 
            : process.env.GOOGLE_SHEET_ID_CATEGORIES;

        if (!spreadsheetId) {
            throw new Error('Chybí ID Google Sheetu v .env');
        }

        // 3. Zápis do tabulky
        // Formát: [UserID, Jméno, Návrh, (SQL vzorec se dopočítá sám), Datum]
        const date = new Date().toLocaleString('cs-CZ');
        
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'A1', // Přidá na první list
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [userId, userName, suggestion, '', date] 
                ],
            },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Chyba při zápisu do Google Sheet:', error);
        return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 });
    }
}