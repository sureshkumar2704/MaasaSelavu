import sys
import os
from database import engine, get_db
from models import Base, User, Room, RoomMember

def init_database():
    print("Connecting to database and creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("All tables created successfully (users, rooms, room_members, expenses, expense_splits, settlements).")
        
        db = next(get_db())
        default_users = [
            {"id": "mem-1", "name": "You (Suresh)", "phone": "9876543210", "code": "1001", "avatar": "bg-emerald-500 text-white"},
            {"id": "mem-2", "name": "Person B", "phone": "9876543211", "code": "1002", "avatar": "bg-indigo-500 text-white"},
            {"id": "mem-3", "name": "Person C", "phone": "9876543212", "code": "1003", "avatar": "bg-amber-500 text-white"},
            {"id": "mem-4", "name": "Person D", "phone": "9876543213", "code": "1004", "avatar": "bg-purple-500 text-white"},
            {"id": "mem-5", "name": "Tamil", "phone": "9876543214", "code": "1005", "avatar": "bg-teal-500 text-white"},
        ]
        for u_data in default_users:
            user = db.query(User).filter(User.id == u_data["id"]).first()
            if not user:
                db.add(User(id=u_data["id"], name=u_data["name"], phone=u_data["phone"], code=u_data["code"], avatar=u_data["avatar"]))
            else:
                user.phone = u_data["phone"]
                user.code = u_data["code"]
                user.avatar = u_data["avatar"]
        db.commit()

        default_rooms = [
            ("room-flat-302", "Flat 302", "FLAT302", ["mem-1", "mem-2", "mem-3", "mem-4", "mem-5"]),
            ("room-goa-vacation", "Goa Vacation", "GOA2026", ["mem-1", "mem-2", "mem-3"])
        ]
        for room_id, name, code, member_ids in default_rooms:
            room = db.query(Room).filter(Room.id == room_id).first()
            if not room:
                db.add(Room(id=room_id, name=name, code=code))
            else:
                room.code = code
            for user_id in member_ids:
                if not db.query(RoomMember).filter(RoomMember.room_id == room_id, RoomMember.user_id == user_id).first():
                    db.add(RoomMember(id=f"rm-{room_id}-{user_id}", room_id=room_id, user_id=user_id))
        db.commit()
        print("Default users and rooms seeded successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
