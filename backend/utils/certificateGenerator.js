const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a registration certificate PDF for a user
 * @param {Object} data - Certificate data (user info, transaction details, etc.)
 * @param {string} certificateType - Type of certificate (registration, entry, winner, etc.)
 * @returns {Promise<Buffer>} - PDF buffer
 */
function generateCertificate(data, certificateType = 'registration') {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'LETTER',
                layout: 'landscape',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Certificate border
            doc.lineWidth(10);
            doc.rect(20, 20, 752, 552).stroke('#1e293b');
            
            doc.lineWidth(3);
            doc.rect(35, 35, 722, 522).stroke('#F59E0B');

            // Header - DeedDraw Logo (using full logo with text included)
            try {
                const logoPath = '/var/www/deeddraw/backend/assets/images/Deeddraw-logo.png';
                if (fs.existsSync(logoPath)) {
                    doc.image(logoPath, 246, 70, { width: 300 }); // Centered, larger size
                } else {
                    // Fallback to text if logo not found
                    doc.fontSize(48)
                       .font('Helvetica-Bold')
                       .fillColor('#1e293b')
                       .text('DeedDraw', 0, 80, { align: 'center' });
                }
            } catch (err) {
                // Fallback to text on error
                console.error('Error loading main logo:', err);
                doc.fontSize(48)
                   .font('Helvetica-Bold')
                   .fillColor('#1e293b')
                   .text('DeedDraw', 0, 80, { align: 'center' });
            }

            // Remove subtitle since it's in the logo now
            // Certificate Title based on type
            const title = certificateType === 'entry' ? 'Entry Certificate' : 'Certificate of Registration';
            doc.fontSize(32)
               .font('Helvetica-Bold')
               .fillColor('#F59E0B')
               .text(title, 50, 150, { align: 'center', width: 692 });

            // Divider line
            doc.moveTo(200, 200).lineTo(592, 200).stroke('#e2e8f0');

            if (certificateType === 'entry') {
                // Entry Certificate Content
                doc.fontSize(16)
                   .font('Helvetica')
                   .fillColor('#475569')
                   .text('This certifies that', 50, 230, { align: 'center', width: 692 });

                // User Name
                const fullName = `${data.firstName} ${data.lastName}`;
                doc.fontSize(36)
                   .font('Helvetica-Bold')
                   .fillColor('#1e293b')
                   .text(fullName, 50, 265, { align: 'center', width: 692 });

                // Entry details
                doc.fontSize(14)
                   .font('Helvetica')
                   .fillColor('#64748b')
                   .text(`has successfully registered an entry with`, 50, 320, { align: 'center', width: 692 })
                   .text(`${data.points} Point${data.points > 1 ? 's' : ''} • $${parseFloat(data.transactionAmount).toLocaleString()} Transaction`, 50, 340, { align: 'center', width: 692 });

                // Certificate Number
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#F59E0B')
                   .text(`Certificate #${data.certificateNumber}`, 50, 380, { align: 'center', width: 692 });

                // Verified date
                const verifiedDate = new Date(data.verifiedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                doc.fontSize(12)
                   .font('Helvetica')
                   .fillColor('#64748b')
                   .text(`Verified on ${verifiedDate}`, 50, 410, { align: 'center', width: 692 });

            } else {
                // Registration Certificate Content
                doc.fontSize(16)
                   .font('Helvetica')
                   .fillColor('#475569')
                   .text('This certifies that', 50, 230, { align: 'center', width: 692 });

                // User Name
                const fullName = `${data.firstName} ${data.lastName}`;
                doc.fontSize(36)
                   .font('Helvetica-Bold')
                   .fillColor('#1e293b')
                   .text(fullName, 50, 265, { align: 'center', width: 692 });

                // Registration details
                const regDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const categoryMap = {
                    'agent-broker': 'Real Estate Agent/Broker',
                    'developer': 'Developer',
                    'sales-marketing': 'Sales & Marketing Professional',
                    'mortgage-broker': 'Mortgage Broker'
                };
                const category = categoryMap[data.category] || 'Professional';

                doc.fontSize(14)
                   .font('Helvetica')
                   .fillColor('#64748b')
                   .text(`has officially registered as a ${category}`, 50, 325, { align: 'center', width: 692 })
                   .text(`in the DeedDraw Real Estate Rewards Program`, 50, 345, { align: 'center', width: 692 })
                   .text(`on ${regDate}`, 50, 365, { align: 'center', width: 692 });

                // Referral Code
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#475569')
                   .text(`Member Referral Code: ${data.referralCode}`, 50, 405, { align: 'center', width: 692 });
            }

            // Footer - Certificate Details
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#94a3b8')
               .text(`Issued: ${new Date().toLocaleDateString('en-US')}`, 50, 510, { align: 'center', width: 692 });

            // Decorative elements - corner logos (navy version)
            try {
                const decorLogoPath = '/var/www/deeddraw/backend/assets/images/Logo-Navy.png';
                if (fs.existsSync(decorLogoPath)) {
                    doc.opacity(0.3);
                    
                    // Top-left corner - rotate -45 degrees
                    doc.save();
                    doc.translate(80, 80);
                    doc.rotate(-45);
                    doc.image(decorLogoPath, -30, -30, { width: 60 });
                    doc.restore();
                    
                    // Top-right corner - rotate +45 degrees
                    doc.save();
                    doc.translate(712, 80);
                    doc.rotate(45);
                    doc.image(decorLogoPath, -30, -30, { width: 60 });
                    doc.restore();
                    
                    // Bottom-left corner - rotate +45 degrees
                    doc.save();
                    doc.translate(80, 512);
                    doc.rotate(45);
                    doc.image(decorLogoPath, -30, -30, { width: 60 });
                    doc.restore();
                    
                    // Bottom-right corner - rotate -45 degrees
                    doc.save();
                    doc.translate(712, 512);
                    doc.rotate(-45);
                    doc.image(decorLogoPath, -30, -30, { width: 60 });
                    doc.restore();
                    
                    doc.opacity(1);
                }
            } catch (err) {
                console.error('Error loading corner logos:', err);
                // Fallback to stars if logo not available
                doc.save();
                doc.translate(80, 80);
                doc.rotate(45);
                doc.fontSize(20).fillColor('#F59E0B').text('★', 0, 0);
                doc.restore();

                doc.save();
                doc.translate(712, 80);
                doc.rotate(45);
                doc.fontSize(20).fillColor('#F59E0B').text('★', 0, 0);
                doc.restore();

                doc.save();
                doc.translate(80, 512);
                doc.rotate(45);
                doc.fontSize(20).fillColor('#F59E0B').text('★', 0, 0);
                doc.restore();

                doc.save();
                doc.translate(712, 512);
                doc.rotate(45);
                doc.fontSize(20).fillColor('#F59E0B').text('★', 0, 0);
                doc.restore();
            }

            // Finalize the PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateCertificate };
