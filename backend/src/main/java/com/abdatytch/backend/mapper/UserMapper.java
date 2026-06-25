package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.request.UserRequestDTO;
import com.abdatytch.backend.dto.response.UserResponseDTO;
import com.abdatytch.backend.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper pour convertir entre User entity et DTOs.
 * Utilise le pattern Mapper pour séparer la logique de conversion.
 */
@Component
public class UserMapper implements IUserMapper {

    /**
     * Convertit une entité User en UserResponseDTO.
     * 
     * @param user l'entité utilisateur à convertir
     * @return le UserResponseDTO correspondant
     */
    public UserResponseDTO toResponseDTO(User user) {
        if (user == null) {return null;}
        
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    /**
     * Convertit un UserRequestDTO en entité User.
     * 
     * @param dto le UserRequestDTO à convertir
     * @return l'entité User correspondante
     */
    public User toEntity(UserRequestDTO dto) {
        if (dto == null) {return null;}
        
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setRole(dto.getRole());
        return user;
    }

    /**
     * Met à jour une entité User existante avec les données d'un UserRequestDTO.
     * 
     * @param user l'entité User à mettre à jour
     * @param dto le UserRequestDTO contenant les nouvelles données
     */
    public void updateEntityFromDTO(User user, UserRequestDTO dto) {
        if (user == null || dto == null) {return;}
        
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        if (dto.getPassword() != null) {
            user.setPassword(dto.getPassword());
        }
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setRole(dto.getRole());
    }
}
