package com.masjid.service;

import com.masjid.model.Settings;
import com.masjid.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsService {
    
    private final SettingsRepository settingsRepository;
    
    public String getSetting(String key, String defaultValue) {
        return settingsRepository.findBySettingKey(key)
                .map(Settings::getSettingValue)
                .orElse(defaultValue);
    }
    
    public boolean getBooleanSetting(String key, boolean defaultValue) {
        String value = getSetting(key, String.valueOf(defaultValue));
        return Boolean.parseBoolean(value);
    }
    
    @Transactional
    public Settings updateSetting(String key, String value, String description) {
        Settings setting = settingsRepository.findBySettingKey(key)
                .orElse(new Settings());
        
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        if (description != null) {
            setting.setDescription(description);
        }
        
        return settingsRepository.save(setting);
    }
    
    public List<Settings> getAllSettings() {
        return settingsRepository.findAll();
    }
}
