#!/usr/bin/env python3
"""Static file server that serves 404.html for missing paths."""

from __future__ import annotations

import argparse
import mimetypes
import os
import socket
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOT_FOUND = ROOT / "404.html"


class DualStackServer(ThreadingHTTPServer):
    """Listen on IPv4 + IPv6 so both localhost and 127.0.0.1 hit this process."""

    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        return super().server_bind()


class HashStudioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=directory or str(ROOT), **kwargs)

    def do_GET(self):  # noqa: N802
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            for index in ("index.html", "index.htm"):
                index_path = os.path.join(path, index)
                if os.path.isfile(index_path):
                    path = index_path
                    break

        if os.path.isfile(path):
            return super().do_GET()

        self.send_error_page()

    def do_HEAD(self):  # noqa: N802
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            for index in ("index.html", "index.htm"):
                index_path = os.path.join(path, index)
                if os.path.isfile(index_path):
                    path = index_path
                    break

        if os.path.isfile(path):
            return super().do_HEAD()

        self.send_response(404)
        ctype = mimetypes.guess_type(str(NOT_FOUND))[0] or "text/html"
        self.send_header("Content-Type", f"{ctype}; charset=utf-8")
        self.send_header("Content-Length", str(NOT_FOUND.stat().st_size))
        self.end_headers()

    def send_error_page(self):
        if not NOT_FOUND.is_file():
            return self.send_error(404, "File not found")

        data = NOT_FOUND.read_bytes()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Connection", "close")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main() -> None:
    parser = argparse.ArgumentParser(description="Hash Studio static server with custom 404")
    parser.add_argument("-p", "--port", type=int, default=8765)
    parser.add_argument(
        "-b",
        "--bind",
        default="::",
        help="Bind address (default :: = IPv4+IPv6 dual-stack)",
    )
    args = parser.parse_args()

    os.chdir(ROOT)
    handler = partial(HashStudioHandler, directory=str(ROOT))

    if args.bind in ("::", "0.0.0.0", ""):
        try:
            server = DualStackServer(("::", args.port), handler)
            bind_note = "IPv4+IPv6 (::)"
        except OSError:
            server = ThreadingHTTPServer(("0.0.0.0", args.port), handler)
            bind_note = "0.0.0.0"
    else:
        server = ThreadingHTTPServer((args.bind, args.port), handler)
        bind_note = args.bind

    print(f"Serving {ROOT}")
    print(f"  http://127.0.0.1:{args.port}/")
    print(f"  http://localhost:{args.port}/")
    print(f"Bind: {bind_note} — missing paths → 404.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
