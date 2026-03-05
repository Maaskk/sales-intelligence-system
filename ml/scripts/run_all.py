#!/usr/bin/env python3
"""
Run All Scripts
===============
Convenience script to run the entire ML pipeline in one command.

Run: python ml/scripts/run_all.py
"""

import subprocess
import sys
from pathlib import Path

def run_script(script_name: str) -> bool:
    """Run a Python script and return success status."""
    script_path = Path(__file__).parent / script_name
    
    print(f"\n{'='*60}")
    print(f"Running: {script_name}")
    print('='*60)
    
    result = subprocess.run(
        [sys.executable, str(script_path)],
        capture_output=False
    )
    
    return result.returncode == 0

def main():
    """Run all ML pipeline scripts in order."""
    print("="*60)
    print("RETAILPRO ML PIPELINE - FULL EXECUTION")
    print("="*60)
    
    scripts = [
        "01_generate_data.py",
        "02_train_model.py",
        "03_generate_predictions.py",
    ]
    
    for script in scripts:
        success = run_script(script)
        if not success:
            print(f"\nError: {script} failed!")
            print("Please check the error messages above.")
            sys.exit(1)
    
    print("\n" + "="*60)
    print("ALL SCRIPTS COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("""
Next Steps:
1. Start the Next.js development server:
   npm run dev

2. Open your browser:
   http://localhost:3000

3. Explore the dashboard:
   - View sales analytics
   - Check ML predictions
   - Analyze product performance
   - Review model metrics
    """)

if __name__ == "__main__":
    main()
