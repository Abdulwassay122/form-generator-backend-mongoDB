const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g., 'field_1'
  label: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['text', 'number', 'textarea', 'select', 'radio', 'checkbox', 'file']
  },
  required: { type: Boolean, default: false },
  options: [String], // for select, radio, checkbox
}, { _id: false });

const SectionSchema = new mongoose.Schema({
  id: { type: String, required: true}, // e.g., 'Section_1'
  name: { type: String, required: true },
  description: { type: String },
  fields: { type: [FieldSchema], required: true },
}, {_id: false})

const FormSchema = new mongoose.Schema({
  userId:{type: String, required:true},
  title: { type: String, required: true },
  description: { type: String },
  sections: { type: [SectionSchema], required: true },
  fields: { type: [FieldSchema], required: true },
}, {
  timestamps: true // adds createdAt and updatedAt
});



module.exports = mongoose.model('CreateForm', FormSchema);