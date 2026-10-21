# Forwarding module for Streamlit Cloud
import os
import sys

PARENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_APP = os.path.join(PARENT_DIR, "streamlit_app.py")

if os.path.exists(ROOT_APP):
    with open(ROOT_APP, "r", encoding="utf-8") as f:
        code = f.read()
    exec(code)
else:
    # Run inline
    import streamlit as st
    st.error("Could not locate main streamlit_app.py")
