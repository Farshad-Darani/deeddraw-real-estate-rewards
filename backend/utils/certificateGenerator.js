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

            // Header - DeedDraw Logo/Title
            doc.fontSize(48)
               .font('Helvetica-Bold')
               .fillColor('#1e293b')
               .text('DeedDraw', 0, 80, { align: 'center' });

            // Subtitle
            doc.fontSize(16)
               .font('Helvetica')
               .fillColor('#64748b')
               .text('Real Estate Rewards Program', 0, 140, { align: 'center' });

            // Certificate Title based on type
            const title = certificateType === 'entry' ? 'Entry Certificate' : 'Certificate of Registration';
            doc.fontSize(32)
               .font('Helvetica-Bold')
               .fillColor('#F59E0B')
               .text(title, 0, 200, { align: 'center' });

            // Divider line
            doc.moveTo(200, 250).lineTo(592, 250).stroke('#e2e8f0');

            if (certificateType === 'entry') {
                // Entry Certificate Content
                doc.fontSize(16)
                   .font('Helvetica')
                   .fillColor('#475569')
                   .text('This certifies that', 0, 280, { align: 'center' });

                // User Name
                const fullName = `${data.firstName} ${data.lastName}`;
                doc.fontSize(36)
                   .font('Helvetica-Bold')
                   .fillColor('#1e293b')
                   .text(fullName, 0, 315, { align: 'center' });

                // Entry details
                doc.fontSize(14)
                   .font('Helvetica')
                   .fillColor('#64748b')
                   .text(`has successfully registered an entry with`, 0, 370, { align: 'center' })
                   .text(`${data.points} Point${data.points > 1 ? 's' : ''} • $${parseFloat(data.transactionAmount).toLocaleString()} Transaction`, 0, 390, { align: 'center' });

                // Certificate Number
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#F59E0B')
                   .text(`Certificate #${data.certificateNumber}`, 0, 430, { align: 'center' });

                // Verified date
                const verifiedDate = new Date(data.verifiedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                doc.fontSize(12)
                   .font('Helvetica')
                   .fillColor('#64748b')
                   .text(`Verified on ${verifiedDate}`, 0, 460, { align: 'center' });

            } else {
                // Registration Certificate Content
                doc.fontSize(16)
                   .font('Helvetica')
                   .fillColor('#475569')
                   .text('This certifies that', 0, 280, { align: 'center' });

                // User Name
                const fullName = `${data.firstName} ${data.lastName}`;
                doc.fontSize(36)
                   .font('Helvetica-Bold')
                   .fillColor('#1e293b')
                   .text(fullName, 0, 315, { align: 'center' });

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
                    'mortgage-broker': 'Mortgage Broker',
                    'individual': 'Individual'
                };
                const category = categoryMap[data.category] || 'Professional';

                doc.fontSize(14)
                   .font('Helvetica')
                   .fillColor('#64748b')
                   .text(`has officially registered as a ${category}`, 0, 375, { align: 'center' })
                   .text(`in the DeedDraw Real Estate Rewards Program`, 0, 395, { align: 'center' })
                   .text(`on ${regDate}`, 0, 415, { align: 'center' });

                // Referral Code
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .fillColor('#475569')
                   .text(`Member Referral Code: ${data.referralCode}`, 0, 455, { align: 'center' });
            }

            // Footer - Certificate Details
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#94a3b8')
               .text(`Issued: ${new Date().toLocaleDateString('en-US')}`, 0, 510, { align: 'center' });

            // Decorative elements - corner ornaments
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

            // Finalize the PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateCertificate };
