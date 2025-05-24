// src/app/api/summarize/route.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import fs from 'fs/promises'
import path from "path";
import { summarizeText } from "@/lib/summarizer";

export async function POST(req: NextRequest){

    try{
        const {path: relativePath} = (await req.json()) as {path: string};

        const absolutePath = path.resolve(process.cwd(), relativePath);

        const content = await fs.readFile(absolutePath, 'utf-8');

        const summary = await summarizeText(relativePath, content);

        return NextResponse.json({summary});
    } catch(err: any){
        console.error('Error in api/summarize: ', err)
        return NextResponse.json(
            {error: 'Failed to summarize file.'},
            {status: 500}
        );
    }

}