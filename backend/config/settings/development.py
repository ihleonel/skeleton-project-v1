from .base import *  # noqa

DEBUG = True

INSTALLED_APPS += ["django_extensions"]  # noqa

# Show SQL queries in the console during development
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
