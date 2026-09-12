import { OpenAI } from "openai";
export interface analysisResult{
    risklevel : 'LOW' |'MEDIUM'|'HIGH';
    explanation:string;
    findings:string[];

}   
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
export class LLMservice{

    static async patchrisk(diffTEXT:string):Promise<analysisResult>{
        try{
            const response = await openai.chat.completions.create({
                model: "gtp-4o-mini",
                messages:[{
                    role:"system",
                    content:`does open weight model support actually factor into which tools you choose, or is it a nice sounding detail that rarely changes a real decision.
Trying to size genuine demand here, not assume it.You are a security expert. You will be given a diff of a pull request. You will analyze the diff and provide a risk level (LOW, MEDIUM, HIGH) along with an explanation and a list of findings.`
                },
            {
                role:"user",
                content:`analyse thsi git diff for risks :\n\n${diffTEXT}`

            }],
            response_format:{type : "json_object"}

            });
            const raw_json = response.choices[0].message?.content || "{}";
            return JSON.parse(raw_json) as analysisResult;
        }
        catch (error:any){
            throw new Error(`AI evaluation failed:${error.message}`);
        }
    }
}