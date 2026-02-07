package com.projet.SmartAgriculture.Services;

import com.projet.SmartAgriculture.Entity.ExpertAgricole;
import com.projet.SmartAgriculture.Repository.ExpertAgricoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExpertAgricoleServiceImpl implements ExpertAgricoleService {

    @Autowired
    private ExpertAgricoleRepository expertAgricoleRepository;

    @Override
    public ExpertAgricole AjouterExpertAgricole(ExpertAgricole expertAgricole) {
        return expertAgricoleRepository.save(expertAgricole);
    }

    @Override
    public ExpertAgricole ModifierExpertAgricole(ExpertAgricole expertAgricole) {
        return expertAgricoleRepository.save(expertAgricole);
    }

    @Override
    public List<ExpertAgricole> AfficherExpertAgricole() {
        return expertAgricoleRepository.findAll();
    }

    @Override
    public void SupprimerExpertAgricole(Long id) {
        expertAgricoleRepository.deleteById(id);
    }

    @Override
    public Optional<ExpertAgricole> AfficherExpertAgricoleById(Long id) {
        return expertAgricoleRepository.findById(id);
    }
}

