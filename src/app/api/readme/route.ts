// src/app/api/readme/route.ts
import { generateReadme } from "@/lib/readmeGenerator";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const markdown = await generateReadme();
        return NextResponse.json({markdown});
    }catch (err: any) {
        console.error('Error in api/readme/', err);
        return NextResponse.json({ error: 'Failed to generate README'}, {status: 500});
        
    }
}