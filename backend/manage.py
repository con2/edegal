#!/usr/bin/env python
import os
import sys
import signal


def sighandler(signum, frame):
    """
    Speed up exit under Docker.
    http://blog.lotech.org/fix-djangos-runserver-when-run-under-docker-or-pycharm.html
    """
    sys.exit(0)


assert sys.version_info.major >= 3, "Edegal requires Python 3"


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, sighandler)
    signal.signal(signal.SIGINT, sighandler)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edegal2.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
