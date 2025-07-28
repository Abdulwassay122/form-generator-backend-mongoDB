const { default: mongoose } = require("mongoose");

const AnswerSchema = new mongoose.Schema({
    fieldId: { type: String, required: true }, // e.g., 'field_1'
    value: mongoose.Schema.Types.Mixed, // could be string, array, number, file path, etc.
    uniqueId:{ type:String }
},{_id:false})



const ResponseSchhema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    email: {type:String, required:true},
    answer: { type: [AnswerSchema], required:true },
}, { timestamps: true })

module.exports = mongoose.model('FormResponse', ResponseSchhema);