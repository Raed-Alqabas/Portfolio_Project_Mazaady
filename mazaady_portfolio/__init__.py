import pymysql

pymysql.install_as_MySQLdb()

# Monkey patch version to satisfy Django's requirement for mysqlclient >= 2.2.1
import MySQLdb
setattr(MySQLdb, 'version_info', (2, 2, 1, 'final', 0))
MySQLdb.__version__ = '2.2.1'
