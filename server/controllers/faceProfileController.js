/**
 *  @author Mandar K.
 * @date 2025-09-13
 * 
 */

// controllers/faceProfileController.js
import FaceProfile from '../models/FaceProfile.js';
import StudentDetails from '../models/StudentDetails.js';

export const faceProfileController = {
  // Capture and store face image
  // Capture and store face image
  capture: async (req, res) => {
    try {
      const { studentId } = req.body;

      if (!studentId) {
        return res.status(400).json({ success: false, message: 'Student ID is required' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Face image is required' });
      }

      // --- START OF FIX ---

      // Verify student exists and update their faceVerified status
      const student = await StudentDetails.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      // Set faceVerified to true
      student.faceVerified = true;

      // Also set the avatarUrl to the new dynamic endpoint
      student.avatarUrl = `/api/face-profile/${studentId}/image`;

      // --- END OF FIX ---

      const imageBuffer = req.file.buffer;

      const faceProfileData = {
        studentId,
        faceImageBlob: imageBuffer,
        imageMetadata: {
          contentType: req.file.mimetype,
          size: imageBuffer.length,
          dimensions: { width: 640, height: 480 }
        },
        captureMetadata: {
          captureDate: new Date(),
          deviceInfo: req.headers['user-agent'] || 'Unknown',
          confidence: 0.8,
          quality: 'medium'
        },
        isActive: true
      };

      const existingProfile = await FaceProfile.findOne({ studentId });

      if (existingProfile) {
        Object.assign(existingProfile, faceProfileData);
        await existingProfile.save();
      } else {
        const newFaceProfile = new FaceProfile(faceProfileData);
        await newFaceProfile.save();
      }

      // --- ANOTHER FIX: Save the updated student and return it ---
      const updatedStudent = await student.save();
      const { password, ...userResponse } = updatedStudent.toObject();


      res.json({
        success: true,
        message: 'Face profile captured and verified successfully',
        user: userResponse // Return the complete updated user object
      });
      // --- END OF FIX ---

    } catch (error) {
      console.error('Face capture error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save face profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get face profile info (without image data)
  getProfile: async (req, res) => {
    try {
      const { studentId } = req.params;

      const faceProfile = await FaceProfile.findOne({ studentId, isActive: true })
        .select('-faceImageBlob') // Exclude the large binary data
        .populate('studentId', 'name email');

      if (!faceProfile) {
        return res.status(404).json({
          success: false,
          message: 'Face profile not found'
        });
      }

      res.json({
        success: true,
        data: faceProfile
      });

    } catch (error) {
      console.error('Get face profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve face profile'
      });
    }
  },

  getFaceImage: async (req, res) => {
    try {
      const { studentId } = req.params;
      const faceProfile = await FaceProfile.findOne({ studentId, isActive: true });

      if (!faceProfile || !faceProfile.faceImageBlob) {
        return res.status(404).json({
          success: false,
          message: 'Face image not found'
        });
      }

      res.set({
        'Content-Type': faceProfile.imageMetadata.contentType,
        'Content-Length': faceProfile.faceImageBlob.length,
      });

      res.send(faceProfile.faceImageBlob);

    } catch (error) {
      console.error('Get face image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve face image'
      });
    }
  },


  // Verify face against stored profile
  verifyFace: async (req, res) => {
    try {
      const { studentId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Verification image is required'
        });
      }

      const faceProfile = await FaceProfile.findOne({ studentId, isActive: true });

      if (!faceProfile) {
        return res.status(404).json({
          success: false,
          message: 'No face profile found for verification'
        });
      }

      // Here you would implement actual face comparison logic
      // For now, we'll return a mock verification result
      const verificationResult = {
        matched: true, // This would be determined by face recognition
        confidence: 0.85,
        timestamp: new Date()
      };

      // Update verification count
      faceProfile.verificationCount += 1;
      faceProfile.lastVerification = new Date();
      await faceProfile.save();

      res.json({
        success: true,
        message: 'Face verification completed',
        data: {
          matched: verificationResult.matched,
          confidence: verificationResult.confidence,
          verificationCount: faceProfile.verificationCount
        }
      });

    } catch (error) {
      console.error('Face verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Face verification failed'
      });
    }
  },

  // Deactivate face profile
  deactivateProfile: async (req, res) => {
    try {
      const { studentId } = req.params;

      const faceProfile = await FaceProfile.findOne({ studentId });

      if (!faceProfile) {
        return res.status(404).json({
          success: false,
          message: 'Face profile not found'
        });
      }

      // Soft delete by setting isActive to false
      faceProfile.isActive = false;
      await faceProfile.save();

      res.json({
        success: true,
        message: 'Face profile deactivated successfully'
      });

    } catch (error) {
      console.error('Delete face profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate face profile'
      });
    }
  }
};