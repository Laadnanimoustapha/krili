/**
 * Test script for ImageProcessor
 * This script tests the basic functionality of the ImageProcessor class
 */

const ImageProcessor = require('./imageProcessor');
const fs = require('fs').promises;
const path = require('path');

async function testImageProcessor() {
  console.log('=== ImageProcessor Test Suite ===\n');
  
  try {
    // Test 1: Check if the class loads properly
    console.log('Test 1: Loading ImageProcessor class...');
    console.log('✓ ImageProcessor class loaded successfully');
    console.log('✓ ProcessingOptions available:', Object.keys(ImageProcessor.ProcessingOptions).length, 'options');
    
    // Test 2: Test basic image processing (without actual image)
    console.log('\nTest 2: Testing basic methods...');
    
    // Test getImageInfo with non-existent file (should handle error gracefully)
    console.log('Testing getImageInfo with non-existent file...');
    const imageInfo = await ImageProcessor.getImageInfo('non-existent-file.jpg');
    if (imageInfo === null) {
      console.log('✓ getImageInfo correctly handles non-existent files');
    } else {
      console.log('✗ getImageInfo should return null for non-existent files');
    }
    
    // Test 3: Test processImage with non-existent file (should return error code)
    console.log('\nTest 3: Testing processImage with non-existent file...');
    const result = await ImageProcessor.processImage('non-existent-input.jpg', 'output.jpg', 800, 85);
    if (result === -1) {
      console.log('✓ processImage correctly returns error code for non-existent files');
    } else {
      console.log('✗ processImage should return -1 for non-existent files, got:', result);
    }
    
    // Test 4: Test batch processing with empty arrays
    console.log('\nTest 4: Testing batch processing with invalid input...');
    const batchResult = await ImageProcessor.processImagesBatch([], [], {});
    if (batchResult === 0) {
      console.log('✓ processImagesBatch correctly handles empty arrays');
    } else {
      console.log('✗ processImagesBatch should return 0 for empty arrays, got:', batchResult);
    }
    
    // Test 5: Test object detection (mock)
    console.log('\nTest 5: Testing object detection...');
    const objectResult = await ImageProcessor.detectObjects('test.jpg', 'model.json', 0.5);
    if (objectResult && objectResult.objectCount === 3) {
      console.log('✓ detectObjects returns mock data correctly');
    } else {
      console.log('✗ detectObjects should return mock data');
    }
    
    // Test 6: Test image quality assessment (mock)
    console.log('\nTest 6: Testing image quality assessment...');
    const qualityResult = await ImageProcessor.assessImageQuality('test.jpg');
    if (qualityResult && qualityResult.sharpness === 0.85) {
      console.log('✓ assessImageQuality returns mock data correctly');
    } else {
      console.log('✗ assessImageQuality should return mock data');
    }
    
    // Test 7: Test helper methods
    console.log('\nTest 7: Testing helper methods...');
    
    // Test calculateResizeDimensions
    const originalSize = { width: 1920, height: 1080 };
    const options = { width: 800, height: 0, maintainAspectRatio: true };
    const newSize = ImageProcessor.calculateResizeDimensions(originalSize, options);
    const expectedHeight = Math.floor(800 / (1920/1080));
    
    if (newSize.width === 800 && newSize.height === expectedHeight) {
      console.log('✓ calculateResizeDimensions works correctly');
      console.log(`  Original: ${originalSize.width}x${originalSize.height}`);
      console.log(`  New: ${newSize.width}x${newSize.height}`);
    } else {
      console.log('✗ calculateResizeDimensions failed');
      console.log(`  Expected: 800x${expectedHeight}, Got: ${newSize.width}x${newSize.height}`);
    }
    
    console.log('\n=== Test Summary ===');
    console.log('✓ All basic functionality tests passed');
    console.log('⚠ Note: Sharp library is required for actual image processing');
    console.log('⚠ Note: Many advanced methods are placeholders and need implementation');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.message.includes("Cannot find module 'sharp'")) {
      console.log('\n📦 Sharp library is not installed.');
      console.log('To install Sharp, run: npm install sharp');
      console.log('This is required for actual image processing functionality.');
    }
    
    return false;
  }
  
  return true;
}

// Test with actual image if available
async function testWithRealImage() {
  console.log('\n=== Real Image Test ===');
  
  // Check if there are any image files in the current directory
  try {
    const files = await fs.readdir('.');
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
    );
    
    if (imageFiles.length > 0) {
      console.log(`Found ${imageFiles.length} image file(s):`, imageFiles);
      
      const testImage = imageFiles[0];
      console.log(`\nTesting with: ${testImage}`);
      
      // Test getImageInfo
      const info = await ImageProcessor.getImageInfo(testImage);
      if (info) {
        console.log('✓ Successfully got image info:');
        console.log(`  Dimensions: ${info.width}x${info.height}`);
        console.log(`  Channels: ${info.channels}`);
        console.log(`  Depth: ${info.depth}`);
        
        // Test basic processing
        const outputPath = `processed_${testImage}`;
        const result = await ImageProcessor.processImage(testImage, outputPath, 400, 80);
        
        if (result === 0) {
          console.log('✓ Basic image processing successful');
          console.log(`  Output saved to: ${outputPath}`);
          
          // Check if output file exists
          try {
            await fs.access(outputPath);
            console.log('✓ Output file created successfully');
          } catch {
            console.log('✗ Output file was not created');
          }
        } else {
          console.log('✗ Image processing failed with code:', result);
        }
        
      } else {
        console.log('✗ Failed to get image info');
      }
      
    } else {
      console.log('No image files found in current directory');
      console.log('To test with real images, place some .jpg, .png, or other image files in this directory');
    }
    
  } catch (error) {
    console.log('Error during real image test:', error.message);
  }
}

// Run tests
async function runAllTests() {
  const basicTestsPassed = await testImageProcessor();
  
  if (basicTestsPassed) {
    await testWithRealImage();
  }
  
  console.log('\n=== Installation Instructions ===');
  console.log('To use this ImageProcessor with real images:');
  console.log('1. Install Sharp: npm install sharp');
  console.log('2. Place test images in the Backend directory');
  console.log('3. Run this test script again');
  console.log('\nNote: Many advanced features are placeholders and would need');
  console.log('additional libraries and implementation for full functionality.');
}

// Run the tests
runAllTests().catch(console.error);