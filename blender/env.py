import subprocess
import sys

python_exe = str(sys.executable)

subprocess.call([python_exe, '-m', 'ensurepip'])
subprocess.call([python_exe, '-m', 'pip', 'install', '--upgrade', 'pip'])
subprocess.call([python_exe, '-m', 'pip', 'install', '--upgrade', 'Pillow'])
