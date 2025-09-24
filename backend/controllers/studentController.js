// studentController.js
const studentService = require('../services/studentService'); // Adjust the path to your studentService

class StudentController {
  // Get all students
  async getAllStudents(req, res) {
    try {
      const students = await studentService.getAllStudents();
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get a student by ID
  async getStudentById(req, res) {
    try {
      const { id } = req.params;
      const student = await studentService.getStudentById(id);
      res.status(200).json(student);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // Update a student by ID
  async updateStudent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedStudent = await studentService.updateStudent(id, updateData);
      res.status(200).json(updatedStudent);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete a student by ID
  async deleteStudent(req, res) {
    try {
      const { id } = req.params;
      const deletedStudent = await studentService.deleteStudent(id);
      res.status(200).json({ message: 'Student deleted successfully', deletedStudent });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new StudentController();