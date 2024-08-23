function paginate(data,request){
    const page_number = Number(request.headers['page_number']||undefined)
    const page_size = Number(request.headers['page_size']||undefined)
    const starting = page_size * page_number;
    if(!isNaN(page_number) && !isNaN(page_size))
        return data.slice(starting,starting+page_size);
    return data;
}

module.exports = { paginate }