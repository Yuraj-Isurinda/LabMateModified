// studentService.js
const Student = require('../models/Student'); // Adjust the path to your Student model

class StudentService {
  // Get all students
  async getAllStudents() {
    try {
      const students = await Student.find();
      return students;
    } catch (error) {
      throw new Error('Error fetching students: ' + error.message);
    }
  }

  // Get a student by ID
  async getStudentById(id) {
    try {
      const student = await Student.findById(id);
      if (!student) {
        throw new Error('Student not found');
      }
      return student;
    } catch (error) {
      throw new Error('Error fetching student: ' + error.message);
    }
  }

  // Update a student by ID
  async updateStudent(id, updateData) {
    try {
      // Check if the updated email or reg_num is already in use by another student
      const existingStudentWithEmail = await Student.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingStudentWithEmail) {
        throw new Error('Email is already in use by another student');
      }

      const existingStudentWithRegNum = await Student.findOne({
        reg_num: updateData.reg_num,
        _id: { $ne: id },
      });
      if (existingStudentWithRegNum) {
        throw new Error('Registration number is already in use by another student');
      }

      const updatedStudent = await Student.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updatedStudent) {
        throw new Error('Student not found');
      }
      return updatedStudent;
    } catch (error) {
      throw new Error('Error updating student: ' + error.message);
    }
  }

  // Delete a student by ID
  async deleteStudent(id) {
    try {
      const deletedStudent = await Student.findByIdAndDelete(id);
      if (!deletedStudent) {
        throw new Error('Student not found');
      }
      return deletedStudent;
    } catch (error) {
      throw new Error('Error deleting student: ' + error.message);
    }
  }
}

module.exports = new StudentService();