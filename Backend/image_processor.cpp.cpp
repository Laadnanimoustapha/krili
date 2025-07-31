#include <opencv2/opencv.hpp>
#include <vector>
//Purpose: High-performance image processing
//Use Case: Optimize uploaded item images
extern "C" {
    void process_image(const char* input_path, const char* output_path, int width, int quality) {
        cv::Mat image = cv::imread(input_path);
        
        // Resize and compress
        cv::Mat resized;
        cv::resize(image, resized, cv::Size(width, (width * image.rows) / image.cols));
        
        std::vector<int> compression_params;
        compression_params.push_back(cv::IMWRITE_JPEG_QUALITY);
        compression_params.push_back(quality);
        
        cv::imwrite(output_path, resized, compression_params);
    }
}