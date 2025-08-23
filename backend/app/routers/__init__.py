from .auth import router as auth_router
from .account import router as account_router
from .contract import router as contract_router
from .device import router as device_router
from .electricity import router as electricity_router
from .invoice import router as invoice_router
from .payment import router as payment_router
from .reservation import router as reservation_router
from .room import router as room_router
from .roomtype import router as roomtype_router
from .tenant import router as tenant_router
from .invoice_detail import router as invoice_detail_router
from .backup import router as backup_router
__all__ = [
    "auth_router",
    "account_router",
    "contract_router",
    "device_router",
    "electricity_router",
    "invoice_router",
    "payment_router",
    "reservation_router",
    "room_router",
    "roomtype_router",
    "tenant_router",
    "invoice_detail_router",
    "backup_router"
]