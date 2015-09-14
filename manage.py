#!/usr/bin/env python
import os
import sys

assert sys.version_info.major >= 3, "Edegal requires Python 3"

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edegal2.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
