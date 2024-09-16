const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error(err));

// Define Mentor schema
const mentorSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const Mentor = mongoose.model('Mentor', mentorSchema);

// Create a mentor
app.post('/api/mentors', async (req, res) => {
  const mentor = new Mentor(req.body);
  await mentor.save();
  res.send(mentor);
});

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  });
  
  const Student = mongoose.model('Student', studentSchema);
  
  // Create a student
  app.post('/api/students', async (req, res) => {
    const student = new Student(req.body);
    await student.save();
    res.send(student);
  });


  // Assign a student to a mentor
app.put('/api/students/:id/assign-mentor', async (req, res) => {
    const student = await Student.findById(req.params.id);
    student.mentor = req.body.mentorId;
    await student.save();
    res.send(student);
  });
// Assign multiple students to a mentor
app.post('/api/mentors/:id/students', async (req, res) => {
    const mentor = await Mentor.findById(req.params.id);
    req.body.students.forEach(async (studentId) => {
      const student = await Student.findById(studentId);
      student.mentor = mentor._id;
      await student.save();
    });
    res.send(mentor);
  });
// Create a student
app.post('/api/students', async (req, res) => {
    const student = new Student(req.body);
    if (!student.mentor) {
      res.send(student);
    } else {
      await student.save();
    }
  });

  // Get all students for a mentor
app.get('/api/mentors/:id/students', async (req, res) => {
    const mentor = await Mentor.findById(req.params.id).populate('students');
    res.send(mentor.students);
  });


  // Get previously assigned mentor for a student
app.get('/api/students/:id/previously-assigned-mentor', async (req, res) => {
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'mentor',
        select: 'name email',
      })
      .exec();
    res.send(student.mentor);
  });

  
app.listen(3000, () => console.log('Server listening on port 3000'));