from sqlalchemy import create_engine, URL, text
import time
import datetime
from pyproj  import Transformer


db_string = URL.create(
    "postgresql",
    username="postgres",
    password="1234",  
    host="localhost",
    database="Mobtest",
    port="5432"
)
print(db_string)

db_connection = create_engine(db_string)

s = "2020-04-21 08:37:27"
vreme=time.mktime(datetime.datetime.strptime(s, "%Y-%m-%d %H:%M:%S").timetuple())

transformer = Transformer.from_crs("EPSG:4326","EPSG:3812" ,  always_xy=True)


userid=1
pointid=1
x=21.878420928034345
y=43.31017785056684 
brzina=0
orjentacija=0
xy=transformer.transform( x, y)
print(xy)
ins="Insert into korisnici values ("+str(userid)+","+str(pointid)+",'"+s+"',"+str(brzina)+","+str(orjentacija)+","+"'SRID=3812;POINT("+str(xy[0])+" "+str(xy[1])+")')"
print(ins)
with db_connection.connect() as conn:
    c = conn.execute(text(ins))
    conn.commit()
    print("Gotovo")
