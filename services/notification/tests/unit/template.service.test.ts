import { TemplateService } from '../../src/services/template.service';

describe('TemplateService', () => {
  it('reminder template includes pet name and owner first name', () => {
    const result = TemplateService.getReminderTemplate('Scooter', 'Jane');
    expect(result.subject).toContain('Scooter');
    expect(result.htmlContent).toContain('Jane');
    expect(result.textContent).toContain('Jane');
  });

  it('OTP template includes the OTP code', () => {
    const result = TemplateService.getOTPTemplate('Jane', '654321');
    expect(result.htmlContent).toContain('654321');
    expect(result.textContent).toContain('654321');
    expect(result.subject).toContain('One-Time');
  });

  it('getTemplate dispatches to the correct template based on templateId', () => {
    const digestResult = TemplateService.getTemplate('digest', { petName: 'Mochi', digestText: 'Great week!' });
    expect(digestResult.subject).toContain('Mochi');
    expect(digestResult.htmlContent).toContain('Great week!');

    const reminderResult = TemplateService.getTemplate('reminder', { petName: 'Mochi', ownerFirstName: 'Bob' });
    expect(reminderResult.subject).toContain('Mochi');
  });
});
