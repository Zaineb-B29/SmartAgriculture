package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin,Long> {
    Admin findAdminByEmail(String email);

    boolean existsByEmail(String email);
}
