"""
🛡️ KRILI Chat Moderation System Launcher
Quick start script for the moderation system
"""

import os
import sys
import webbrowser
import time
import subprocess
from pathlib import Path

def print_banner():
    print("🛡️" + "="*60 + "🛡️")
    print("    KRILI CHAT MODERATION SYSTEM")
    print("    ML-Powered Security for Your Chat Platform")
    print("🛡️" + "="*60 + "🛡️")
    print()

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = ['numpy', 'pandas', 'scikit-learn', 'flask', 'flask-cors']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️ Missing packages: {', '.join(missing_packages)}")
        print("Run: python install_moderation_deps.py")
        return False
    
    print("✅ All dependencies installed!")
    return True

def start_api_server():
    """Start the moderation API server"""
    print("\n🚀 Starting Moderation API Server...")
    print("   URL: http://localhost:5000")
    print("   Dashboard: http://localhost:5000")
    print("   Health Check: http://localhost:5000/health")
    print("\n⏳ Starting server (this may take a few seconds)...")
    
    # Start the API server
    try:
        subprocess.run([
            sys.executable, 
            "chat_moderation_system.py", 
            "api"
        ], cwd=Path(__file__).parent)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")

def open_demo():
    """Open the demo interface"""
    demo_path = Path(__file__).parent / "demo_integration.html"
    if demo_path.exists():
        print(f"\n🌐 Opening demo interface...")
        webbrowser.open(f"file://{demo_path.absolute()}")
    else:
        print(f"\n⚠️ Demo file not found: {demo_path}")

def show_menu():
    """Show the main menu"""
    print("\n📋 What would you like to do?")
    print("   1. 🚀 Start API Server")
    print("   2. 🧪 Run Examples")
    print("   3. 🎓 Train Models")
    print("   4. 🌐 Open Demo Interface")
    print("   5. 📊 View Documentation")
    print("   6. 🔧 Install Dependencies")
    print("   7. ❌ Exit")
    print()

def run_examples():
    """Run the example tests"""
    print("\n🧪 Running example tests...")
    try:
        subprocess.run([
            sys.executable, 
            "chat_moderation_system.py", 
            "example"
        ], cwd=Path(__file__).parent)
    except Exception as e:
        print(f"❌ Error running examples: {e}")

def train_models():
    """Train the ML models"""
    print("\n🎓 Training ML models...")
    try:
        subprocess.run([
            sys.executable, 
            "chat_moderation_system.py", 
            "train"
        ], cwd=Path(__file__).parent)
    except Exception as e:
        print(f"❌ Error training models: {e}")

def install_dependencies():
    """Install required dependencies"""
    print("\n🔧 Installing dependencies...")
    try:
        subprocess.run([
            sys.executable, 
            "install_moderation_deps.py"
        ], cwd=Path(__file__).parent)
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")

def view_documentation():
    """Open documentation files"""
    docs = [
        ("📖 Complete Documentation", "README_Chat_Moderation.md"),
        ("🔗 Integration Guide", "KRILI_Integration_Guide.md"),
        ("📋 System Summary", "SYSTEM_SUMMARY.md")
    ]
    
    print("\n📚 Available Documentation:")
    for i, (name, filename) in enumerate(docs, 1):
        print(f"   {i}. {name}")
    
    try:
        choice = input("\nSelect documentation (1-3) or press Enter to skip: ").strip()
        if choice and choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(docs):
                doc_path = Path(__file__).parent / docs[idx][1]
                if doc_path.exists():
                    # Try to open with default text editor
                    if sys.platform == "win32":
                        os.startfile(doc_path)
                    else:
                        subprocess.run(["open" if sys.platform == "darwin" else "xdg-open", doc_path])
                    print(f"✅ Opened {docs[idx][0]}")
                else:
                    print(f"❌ File not found: {doc_path}")
    except (ValueError, KeyboardInterrupt):
        pass

def main():
    """Main launcher function"""
    print_banner()
    
    # Check if we're in the right directory
    current_dir = Path(__file__).parent
    main_script = current_dir / "chat_moderation_system.py"
    
    if not main_script.exists():
        print("❌ Error: chat_moderation_system.py not found!")
        print(f"   Make sure you're running this from: {current_dir}")
        return
    
    # Check dependencies
    if not check_dependencies():
        print("\n🔧 Would you like to install missing dependencies? (y/n): ", end="")
        if input().lower().startswith('y'):
            install_dependencies()
        else:
            print("⚠️ Some features may not work without dependencies.")
    
    # Main menu loop
    while True:
        try:
            show_menu()
            choice = input("Enter your choice (1-7): ").strip()
            
            if choice == "1":
                start_api_server()
            elif choice == "2":
                run_examples()
            elif choice == "3":
                train_models()
            elif choice == "4":
                open_demo()
            elif choice == "5":
                view_documentation()
            elif choice == "6":
                install_dependencies()
            elif choice == "7":
                print("\n👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please select 1-7.")
            
            if choice != "1":  # Don't show "press enter" for API server
                input("\nPress Enter to continue...")
                
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            input("Press Enter to continue...")

if __name__ == "__main__":
    main()