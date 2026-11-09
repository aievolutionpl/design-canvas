"""Run the workspace regression suite with a temporary local HTTP server.

Requires Node.js and Python Playwright with Chromium installed.
A missing test/prerequisite fails; no synthetic pass results.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import subprocess
import sys
from threading import Thread

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def main():
    node_tests = sorted((ROOT / "tests").glob("test-*.mjs")) + sorted((ROOT / "tests").glob("test-*.js"))
    if not node_tests:
        raise RuntimeError("No Node regression tests found")
    subprocess.run(["node", "--test", *map(str, node_tests)], cwd=ROOT, check=True)
    browser_tests = [ROOT / "tools/verify_workspace_shell.py", ROOT / "tools/verify_kit.py", ROOT / "tools/verify_workspace_integration.py"]
    for test in browser_tests:
        if not test.is_file():
            raise RuntimeError(f"Required browser test missing: {test.name}")
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}/"
    try:
        for test in browser_tests:
            subprocess.run([sys.executable, str(test), base], cwd=ROOT, check=True)
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
    print("Workspace regression suite completed successfully.")


if __name__ == "__main__":
    main()
