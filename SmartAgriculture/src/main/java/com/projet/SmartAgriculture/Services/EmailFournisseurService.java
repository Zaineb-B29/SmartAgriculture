package com.projet.SmartAgriculture.Services;

import jakarta.mail.internet.MimeMessage;

public interface EmailFournisseurService {
    public MimeMessage createMimeMessage();
    public void SendEmail(MimeMessage message);

}
