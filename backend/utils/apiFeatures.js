class ApiFeature {
    constructor(query, queryStr){
        this.query = query,
        this.queryStr = queryStr
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name : {
                $regex:this.queryStr.keyword ,
                $options : "i" //For Case sensetive
            },
        }:{}

        this.query = this.query.find({...keyword});
        return this;
    }

    filter(){

        const queryCopy = {...this.query};

        //Removing some fields for catagory
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach((key) =>delete queryCopy[key]);

        //Filter For price and rating

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key)=>`$${key}`);


        this.query = this.query.find(JSON.parse(queryStr))
        return this;
        

    }

    pagination(resultPerPage){
        const cuirrentPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (cuirrentPage - 1 );

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this; 
    }

}

module.exports = ApiFeature