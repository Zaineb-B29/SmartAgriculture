package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Admin;
import java.util.List;
import java.util.Optional;

public interface AdminService {
    Admin AjouterAdmin(Admin admin);
    Admin ModifierAdmin(Admin admin);
    List<Admin> AfficherAdmin();
    void SupprimerAdmin(Long id);
    Optional<Admin> AfficherAdminById(Long id);
}
