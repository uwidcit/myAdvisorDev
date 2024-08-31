const http=require('node:http'), https=require('https'), {spawn}=require('node:child_process') //tests begin below requestURL function
async function bufferChunk(stream,maxLength=Infinity){
    return new Promise((resolve,reject)=>{
        var temp="" //adding text faster than Buffer.concat
        stream.on('data', function(chunk){
            if(temp.length+chunk.length>maxLength)
                return reject("data length exceeded");
            temp+=chunk.toString('binary')
        })
        stream.on('end', function(){resolve(temp)})
        stream.on('error', reject)
    })
}
async function shell(command,cwd=__dirname,timeout=2**32/2-1,env=process.env,input){
    if(typeof command==="string") command=command.split(' ');
    env.PATH ||= process.env.PATH
    return new Promise(function(resolve){
        let options={stdio:'pipe',env,cwd}, out="", err="", t=null
        let myChild=spawn(command[0],command.slice(1),options)
        myChild.on('close', function(){
            clearTimeout(t)
            resolve( JSON.stringify({out:out.trim(),err:err.trim()}) )
        })
        myChild.on('error', function(error){err+="\n\n"+error})
        myChild.on('spawn', function(){
            if(input){
                myChild.stdin?.write(input)
                myChild.stdin?.end()
            }
            t=setTimeout(async function(){
                myChild.kill('SIGKILL')
                err+="Time Limit Exceeded"
            },timeout)
            myChild.stdout?.on('data', function(chunk){out+=chunk.toString(binary)})
            myChild.stderr?.on('data', function(chunk){err+=chunk.toString(binary)})
        })
    })
}
async function requestURL(url,method="GET",headers={},data=""){
    if(typeof data==="string") data=Buffer.from(data,'binary');
    try{var {hostname,protocol,pathname,search}=new URL(url)}
    catch{return "INVALID URL"}
    return new Promise(function(resolve,reject){
        let options={hostname, port:protocol==="https:"?443:80, path:pathname+search, method, headers}
        let request=(protocol==="https:"?https:http).request(options,async function respond(response){
            resolve(  {headers:response.headers, body:await bufferChunk(response)}  )
        })
        request.on('error',function(error){ reject(error.code||error.message||error) })
        request.write(data)
        request.end()
    })
}

const test=require('node:test'), assert=require('node:assert');
(async function(){
    await test("Example Test Category",async function(t){
        await t.test("Specific Test 1",async function(){
            assert.strictEqual(1,1,"this should've never failed")
        })
        await t.test("Specific Test 2",async function(){
            assert.deepStrictEqual([1,2,3],[1,2,3],"this should've never failed")
        })
    })
})()