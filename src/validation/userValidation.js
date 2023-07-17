
const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const isvalidBody = (value) => {
    return Object.keys(value).length > 0
}

const isValid = (value) => {
    if(typeof value === "undefined" || value == null) return false
    if(typeof value === "string" && value.trim().length ===0) return false
    return true
}

const isValidField = (value) => {
    if(typeof value === "string" && value.trim().length ===0) return false
    return true
}

module.exports = {nameRegex, emailRegex, passwordRegex, isvalidBody, isValid, isValidField}