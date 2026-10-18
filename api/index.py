import sys
import os

# Dynamically locate backend directory
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)

# Check both root/trustshield-ai/backend and root/backend
backend_dir = os.path.join(root_dir, 'trustshield-ai', 'backend')
if not os.path.exists(backend_dir):
    backend_dir = os.path.join(root_dir, 'backend')

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Set database path to /tmp for read-only Vercel serverless environment
if os.getenv("VERCEL"):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/trustshield.db"

from main import app
