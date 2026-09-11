import axios from "axios";
export class GitHubService{
    static async getPullreq( owner:string , repo:string , pr:number, token:string ): Promise<string>{
        try {
            const response = await axios.get('https://api.github.com/repos/${owner}/${repo}/pulls/${pr}',{
                headers:{
                    Authorization :`token ${token}`,
                    Accept: 'application/vnd.github.v3diff',
                }
            });
            return response.data;
        }catch (error:any){
            throw new Error(`github request failed: ${error.message}`);
        }
        }
}