import pkg_resources

packages = [
    'flask',
    'flask-cors',
    'numpy',
    'pandas',
    'python-dotenv',
    'requests',
    'schedule',
    'scikit-learn',
    'tensorflow'
]

for package in packages:
    try:
        version = pkg_resources.get_distribution(package).version
        print(f"{package}=={version}")
    except pkg_resources.DistributionNotFound:
        print(f"{package} is not installed")
