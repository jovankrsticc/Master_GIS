###This is to be run on the Sumo server.
import traci
import time
import traci.constants as tc
import pytz
import datetime
from random import randrange
import pandas as pd
from sqlalchemy import create_engine, URL, text
from pyproj  import Transformer

def bazaupis(userid,x,y,brzina,orjentacija,vreme):
        global db_connection
        global transformer
        xy=transformer.transform( x, y)
        ins="Insert into korisnici(userid,t,brzina,orjentacija,geom) values ('"+userid+"','"+vreme+"',"+str(brzina)+","+str(orjentacija)+","+"'SRID=3812;POINT("+str(xy[0])+" "+str(xy[1])+")')"
        with db_connection.connect() as conn:
                conn.execute(text(ins))
                conn.commit()
        return 0


def getdatetime():
        utc_now = pytz.utc.localize(datetime.datetime.utcnow())
        currentDT = utc_now.astimezone(pytz.timezone("Asia/Singapore"))
        DATIME = currentDT.strftime("%Y-%m-%d %H:%M:%S")
        return DATIME


db_string = URL.create(
    "postgresql",
    username="postgres",
    password="1234",  
    host="localhost",
    database="Mobtest",
    port="5432"
)
db_connection = create_engine(db_string)

transformer = Transformer.from_crs("EPSG:4326","EPSG:3812" ,  always_xy=True)


sumoCmd = ["sumo-gui", "-c", "osm.sumocfg","--end", "5"]
traci.start(sumoCmd)
traci.setOrder(1) # number can be anything as long as each client gets its own number

while traci.simulation.getMinExpectedNumber() > 0:
       
        traci.simulationStep();

        vehicles=traci.vehicle.getIDList();
        trafficlights=traci.trafficlight.getIDList();

        for i in range(0,len(vehicles)):

                
                vehid = vehicles[i]
                x, y = traci.vehicle.getPosition(vehicles[i])
                coord = [x, y]
                lon, lat = traci.simulation.convertGeo(x, y)
                gpscoord = [lon, lat]
                spd = round(traci.vehicle.getSpeed(vehicles[i])*3.6,2)
                edge = traci.vehicle.getRoadID(vehicles[i])
                lane = traci.vehicle.getLaneID(vehicles[i])
                displacement = round(traci.vehicle.getDistance(vehicles[i]),2)
                turnAngle = round(traci.vehicle.getAngle(vehicles[i]),2)
                nextTLS = traci.vehicle.getNextTLS(vehicles[i])

                #Packing of all the data for export to CSV/XLSX
                vehList = [getdatetime(), vehid, coord, gpscoord, spd, edge, lane, displacement, turnAngle, nextTLS]
                
                bazaupis(vehicles[i],lon,lat, round(traci.vehicle.getSpeed(vehicles[i])*3.6,2),turnAngle,getdatetime())
                if vehicles[i]=="veh24" :
                        print("Vehicle: ", vehicles[i], " at datetime: ", getdatetime())
                        print(vehicles[i], " >>> Position: ", coord, " | GPS Position: ", gpscoord, " |", \
                                        " Speed: ", round(traci.vehicle.getSpeed(vehicles[i])*3.6,2), "km/h |", \
                                        #Returns the id of the edge the named vehicle was at within the last step.
                                        " EdgeID of veh: ", traci.vehicle.getRoadID(vehicles[i]), " |", \
                                        #Returns the id of the lane the named vehicle was at within the last step.
                                        " LaneID of veh: ", traci.vehicle.getLaneID(vehicles[i]), " |", \
                                        #Returns the distance to the starting point like an odometer.
                                        " Distance: ", round(traci.vehicle.getDistance(vehicles[i]),2), "m |", \
                                        #Returns the angle in degrees of the named vehicle within the last step.
                                        " Vehicle orientation: ", round(traci.vehicle.getAngle(vehicles[i]),2), "deg |", \
                                        #Return list of upcoming traffic lights [(tlsID, tlsIndex, distance, state), ...]
                                        " Upcoming traffic lights: ", traci.vehicle.getNextTLS(vehicles[i]), \
                        )

   
traci.close()