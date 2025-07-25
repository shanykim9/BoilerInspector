import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import json
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import base64
from io import BytesIO
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app, origins=['*'])

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///boiler_inspection.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize database
db = SQLAlchemy(app)

# Upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Database Models
class Inspector(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Site(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text)
    contact_person = db.Column(db.String(100))
    contact_phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Inspection(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_number = db.Column(db.String(50), unique=True)
    inspection_date = db.Column(db.Date, nullable=False)
    inspector_id = db.Column(db.Integer, db.ForeignKey('inspector.id'))
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    
    # Installation info
    installation_location = db.Column(db.String(200))
    installation_date = db.Column(db.Date)
    years_in_use = db.Column(db.String(20))
    products = db.Column(db.Text)  # JSON string
    
    # Technical details
    fuel_type = db.Column(db.String(50))
    manufacture_year = db.Column(db.String(10))
    rated_voltage = db.Column(db.String(20))
    piping_type = db.Column(db.String(50))
    water_quality = db.Column(db.String(50))
    control_method = db.Column(db.String(50))
    installation_purpose = db.Column(db.String(100))
    product_form = db.Column(db.String(50))
    
    # Inspection results
    result = db.Column(db.String(20))
    summary = db.Column(db.Text)
    site_condition = db.Column(db.Text)
    checklist = db.Column(db.Text)  # JSON string
    photos = db.Column(db.Text)  # JSON string - array of photo URLs
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# API Routes
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/inspectors', methods=['GET'])
def get_inspectors():
    inspectors = Inspector.query.all()
    return jsonify([{
        'id': i.id,
        'name': i.name,
        'phone': i.phone,
        'email': i.email
    } for i in inspectors])

@app.route('/api/inspectors', methods=['POST'])
def create_inspector():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    inspector = Inspector(
        name=data.get('name'),
        phone=data.get('phone'),
        email=data.get('email')
    )
    db.session.add(inspector)
    db.session.commit()
    return jsonify({'id': inspector.id, 'name': inspector.name})

@app.route('/api/sites', methods=['GET'])
def get_sites():
    search = request.args.get('search', '')
    sites = Site.query.filter(
        Site.name.contains(search) if search else True
    ).all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'address': s.address,
        'contactPerson': s.contact_person,
        'contactPhone': s.contact_phone
    } for s in sites])

@app.route('/api/sites', methods=['POST'])
def create_site():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    site = Site(
        name=data.get('name'),
        address=data.get('address'),
        contact_person=data.get('contactPerson'),
        contact_phone=data.get('contactPhone')
    )
    db.session.add(site)
    db.session.commit()
    return jsonify({'id': site.id, 'name': site.name})

@app.route('/api/inspections', methods=['GET'])
def get_inspections():
    inspections = Inspection.query.order_by(Inspection.created_at.desc()).all()
    result = []
    for inspection in inspections:
        inspector = Inspector.query.get(inspection.inspector_id) if inspection.inspector_id else None
        site = Site.query.get(inspection.site_id) if inspection.site_id else None
        
        result.append({
            'id': inspection.id,
            'documentNumber': inspection.document_number or f'DOC-{inspection.id[:8]}',
            'inspectionDate': inspection.inspection_date.isoformat() if inspection.inspection_date else None,
            'inspector': inspector.name if inspector else None,
            'site': site.name if site else None,
            'result': inspection.result,
            'createdAt': inspection.created_at.isoformat()
        })
    
    return jsonify(result)

@app.route('/api/inspections/<inspection_id>', methods=['GET'])
def get_inspection(inspection_id):
    inspection = Inspection.query.get_or_404(inspection_id)
    
    # Parse JSON fields
    products = json.loads(inspection.products) if inspection.products else []
    checklist = json.loads(inspection.checklist) if inspection.checklist else {}
    photos = json.loads(inspection.photos) if inspection.photos else []
    
    return jsonify({
        'id': inspection.id,
        'documentNumber': inspection.document_number,
        'inspectionDate': inspection.inspection_date.isoformat() if inspection.inspection_date else None,
        'inspectorId': inspection.inspector_id,
        'siteId': inspection.site_id,
        'installationLocation': inspection.installation_location,
        'installationDate': inspection.installation_date.isoformat() if inspection.installation_date else None,
        'yearsInUse': inspection.years_in_use,
        'products': products,
        'fuelType': inspection.fuel_type,
        'manufactureYear': inspection.manufacture_year,
        'ratedVoltage': inspection.rated_voltage,
        'pipingType': inspection.piping_type,
        'waterQuality': inspection.water_quality,
        'controlMethod': inspection.control_method,
        'installationPurpose': inspection.installation_purpose,
        'productForm': inspection.product_form,
        'result': inspection.result,
        'summary': inspection.summary,
        'siteCondition': inspection.site_condition,
        'checklist': checklist,
        'photos': photos
    })

@app.route('/api/inspections', methods=['POST'])
def create_inspection():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    inspection_id = str(uuid.uuid4())
    
    inspection = Inspection(
        id=inspection_id,
        document_number=data.get('documentNumber', f'DOC-{inspection_id[:8]}'),
        inspection_date=datetime.fromisoformat(data['inspectionDate']).date() if data.get('inspectionDate') else datetime.now().date(),
        inspector_id=data.get('inspectorId'),
        site_id=data.get('siteId')
    )
    
    db.session.add(inspection)
    db.session.commit()
    
    return jsonify({'id': inspection.id})

@app.route('/api/inspections/<inspection_id>', methods=['PUT'])
def update_inspection(inspection_id):
    inspection = Inspection.query.get_or_404(inspection_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Update fields
    if 'documentNumber' in data:
        inspection.document_number = data['documentNumber']
    if 'inspectionDate' in data and data['inspectionDate']:
        inspection.inspection_date = datetime.fromisoformat(data['inspectionDate']).date()
    if 'inspectorId' in data:
        inspection.inspector_id = data['inspectorId']
    if 'siteId' in data:
        inspection.site_id = data['siteId']
    if 'installationLocation' in data:
        inspection.installation_location = data['installationLocation']
    if 'installationDate' in data and data['installationDate']:
        inspection.installation_date = datetime.fromisoformat(data['installationDate']).date()
    if 'yearsInUse' in data:
        inspection.years_in_use = data['yearsInUse']
    if 'products' in data:
        inspection.products = json.dumps(data['products'])
    if 'fuelType' in data:
        inspection.fuel_type = data['fuelType']
    if 'manufactureYear' in data:
        inspection.manufacture_year = data['manufactureYear']
    if 'ratedVoltage' in data:
        inspection.rated_voltage = data['ratedVoltage']
    if 'pipingType' in data:
        inspection.piping_type = data['pipingType']
    if 'waterQuality' in data:
        inspection.water_quality = data['waterQuality']
    if 'controlMethod' in data:
        inspection.control_method = data['controlMethod']
    if 'installationPurpose' in data:
        inspection.installation_purpose = data['installationPurpose']
    if 'productForm' in data:
        inspection.product_form = data['productForm']
    if 'result' in data:
        inspection.result = data['result']
    if 'summary' in data:
        inspection.summary = data['summary']
    if 'siteCondition' in data:
        inspection.site_condition = data['siteCondition']
    if 'checklist' in data:
        inspection.checklist = json.dumps(data['checklist'])
    if 'photos' in data:
        inspection.photos = json.dumps(data['photos'])
    
    inspection.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/api/inspections/<inspection_id>/photos', methods=['POST'])
def upload_photo(inspection_id):
    if 'photo' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Create upload directory for this inspection
        upload_dir = os.path.join(UPLOAD_FOLDER, 'inspections', inspection_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        filename = secure_filename(file.filename or 'uploaded_file')
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Create relative URL
        photo_url = f"/uploads/inspections/{inspection_id}/{unique_filename}"
        
        # Update inspection with new photo
        inspection = Inspection.query.get(inspection_id)
        if inspection:
            photos = json.loads(inspection.photos) if inspection.photos else []
            photos.append(photo_url)
            inspection.photos = json.dumps(photos)
            db.session.commit()
        else:
            # Create temporary inspection record
            inspection = Inspection(
                id=inspection_id,
                document_number=f'TEMP-{inspection_id[:8]}',
                inspection_date=datetime.now().date(),
                photos=json.dumps([photo_url])
            )
            db.session.add(inspection)
            db.session.commit()
        
        return jsonify({'photoUrl': photo_url})
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Initialize database
with app.app_context():
    db.create_all()
    
    # Add sample data if tables are empty
    if Inspector.query.count() == 0:
        sample_inspectors = [
            Inspector(name="김철수", phone="010-1234-5678", email="kim@example.com"),
            Inspector(name="이영희", phone="010-2345-6789", email="lee@example.com"),
            Inspector(name="박민수", phone="010-3456-7890", email="park@example.com")
        ]
        for inspector in sample_inspectors:
            db.session.add(inspector)
    
    if Site.query.count() == 0:
        sample_sites = [
            Site(name="서울아파트", address="서울시 강남구", contact_person="관리사무소", contact_phone="02-123-4567"),
            Site(name="부산빌딩", address="부산시 해운대구", contact_person="빌딩관리팀", contact_phone="051-234-5678"),
            Site(name="대구오피스텔", address="대구시 수성구", contact_person="시설관리", contact_phone="053-345-6789")
        ]
        for site in sample_sites:
            db.session.add(site)
    
    db.session.commit()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)