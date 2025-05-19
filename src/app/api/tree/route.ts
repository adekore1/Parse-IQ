import { NextResponse } from "next/server";
import { parseDirectory } from "@/lib/parser";

export async function GET(){
    // Start parser at the project root
    const tree = await parseDirectory(process.cwd());

    // Return it as JSON
    return NextResponse.json(tree);

}