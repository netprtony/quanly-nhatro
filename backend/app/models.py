# models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Enum, DECIMAL, Date, func
from sqlalchemy.orm import relationship
from .database import Base
import enum
import datetime

# --- ENUM DEFINITIONS ---
class RoleEnum(str, enum.Enum):
    USER = 'USER'
    ADMIN = 'ADMIN'

class GenderEnum(str, enum.Enum):
    Male = 'Male'
    Female = 'Female'
    Other = 'Other'

class ContractStatusEnum(str, enum.Enum):
    Active = 'Active'
    Terminated = 'Terminated'
    Pending = 'Pending'

class PaymentMethodEnum(str, enum.Enum):
    Cash = 'Cash'
    BankTransfer = 'BankTransfer'
    Momo = 'Momo'
    ZaloPay = 'ZaloPay'
    Other = 'Other'

class FeeTypeEnum(str, enum.Enum):
    Rent = 'Rent'
    Electricity = 'Electricity'
    Trash = 'Trash'
    Water = 'Water'
    Wifi = 'Wifi'
    Other = 'Other'

class RepairStatusEnum(str, enum.Enum):
    Pending = 'Pending'
    InProgress = 'In Progress'
    Completed = 'Completed'
    Cancelled = 'Cancelled'

class ReservationStatusEnum(str, enum.Enum):
    Pending = "Pending"
    Confirmed = "Confirmed"
    Cancelled = "Cancelled"

# --- MODEL DEFINITIONS ---
class Tenant(Base):
    __tablename__ = "Tenants"
    tenant_id = Column(String(15), primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    gender = Column(Enum(GenderEnum), default=GenderEnum.Other)
    date_of_birth = Column(Date)
    phone_number = Column(String(20))
    email = Column(String(100))
    id_card_front_path = Column(String(255))
    id_card_back_path = Column(String(255))
    address = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "Users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    tenant_id = Column(String(15), ForeignKey("Tenants.tenant_id", ondelete="CASCADE"), unique=True)
    token = Column(String(512))
    otp_code = Column(String(10))
    otp_expiry = Column(DateTime)
    role = Column(Enum(RoleEnum), default=RoleEnum.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    reservations = relationship("Reservation", back_populates="user", cascade="all, delete")

class RoomType(Base):
    __tablename__ = "RoomTypes"
    room_type_id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    price_per_month = Column(DECIMAL(10, 2), nullable=False)

    rooms = relationship("Room", back_populates="room_type")

class Room(Base):
    __tablename__ = "Rooms"
    room_id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String(50), unique=True, nullable=False)
    room_type_id = Column(Integer, ForeignKey("RoomTypes.room_type_id", ondelete="CASCADE"), nullable=False)
    max_occupants = Column(Integer, default=1)
    is_available = Column(Boolean, default=True)
    floor_number = Column(Integer)
    description = Column(Text)

    room_type = relationship("RoomType", back_populates="rooms")
    reservations = relationship("Reservation", back_populates="room", cascade="all, delete")

class Contract(Base):
    __tablename__ = "Contracts"
    contract_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(15), ForeignKey("Tenants.tenant_id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("Rooms.room_id", ondelete="CASCADE"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    deposit_amount = Column(DECIMAL(10, 2))
    monthly_rent = Column(DECIMAL(10, 2))
    contract_status = Column(Enum(ContractStatusEnum), default=ContractStatusEnum.Active)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ElectricityMeter(Base):
    __tablename__ = "ElectricityMeters"
    meter_id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("Rooms.room_id", ondelete="CASCADE"), nullable=False)
    month = Column(Date, nullable=False)
    old_reading = Column(Integer, nullable=False)
    new_reading = Column(Integer, nullable=False)
    electricity_rate = Column(DECIMAL(10, 2), default=3500)
    usage_kwh = Column(Integer)  # Tính phía backend
    total_amount = Column(DECIMAL(10, 2))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Invoice(Base):
    __tablename__ = "Invoices"
    invoice_id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("Rooms.room_id", ondelete="CASCADE"), nullable=False)
    month = Column(Date, nullable=False)
    total_amount = Column(DECIMAL(12, 2))
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InvoiceDetail(Base):
    __tablename__ = "InvoiceDetails"
    detail_id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("Invoices.invoice_id", ondelete="CASCADE"), nullable=False)
    meter_id = Column(Integer, ForeignKey("ElectricityMeters.meter_id", ondelete="SET NULL"), nullable=True)
    fee_type = Column(Enum(FeeTypeEnum), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    note = Column(Text)

class Payment(Base):
    __tablename__ = "Payments"
    payment_id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("Invoices.invoice_id", ondelete="CASCADE"), nullable=False)
    paid_amount = Column(DECIMAL(12, 2), nullable=False)
    payment_date = Column(DateTime, default=datetime.datetime.utcnow)
    payment_method = Column(Enum(PaymentMethodEnum), default=PaymentMethodEnum.Cash)
    transaction_reference = Column(String(100))
    note = Column(Text)

class RepairRequest(Base):
    __tablename__ = "RepairRequests"
    request_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(15), ForeignKey("Tenants.tenant_id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("Rooms.room_id", ondelete="CASCADE"), nullable=False)
    request_date = Column(DateTime, default=datetime.datetime.utcnow)
    issue_description = Column(Text, nullable=False)
    status = Column(Enum(RepairStatusEnum), default=RepairStatusEnum.Pending)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Reservation(Base):
    __tablename__ = "Reservations"
    reservation_id = Column(Integer, primary_key=True, index=True)
    contact_phone = Column(String(15), nullable=False)
    room_id = Column(Integer, ForeignKey("Rooms.room_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("Users.id", ondelete="CASCADE"), nullable=True)
    status = Column(Enum(ReservationStatusEnum), default=ReservationStatusEnum.Pending, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="reservations")
    room = relationship("Room", back_populates="reservations")

class Notification(Base):
    __tablename__ = "Notifications"
    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Device(Base):
    __tablename__ = "Devices"
    device_id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String(100), nullable=False)
    room_id = Column(Integer, ForeignKey("Rooms.room_id", ondelete="SET NULL"), nullable=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)