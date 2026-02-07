package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.Admin;
import com.projet.SmartAgriculture.Repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AdminServiceImpl implements AdminService{
    @Autowired //to call this page from another page
    AdminRepository adminRepository;

    @Override
    public Admin AjouterAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    @Override
    public Admin ModifierAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    @Override
    public List<Admin> AfficherAdmin() {
        return adminRepository.findAll();
    }

    @Override
    public void SupprimerAdmin(Long id) {
        adminRepository.deleteById(id);
    }

    @Override
    public Optional<Admin> AfficherAdminById(Long id) {
        return adminRepository.findById(id);
    }
}
