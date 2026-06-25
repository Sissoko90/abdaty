package com.abdatytch.backend.mapper;

import com.abdatytch.backend.dto.request.UserRequestDTO;
import com.abdatytch.backend.dto.response.UserResponseDTO;
import com.abdatytch.backend.entity.User;

/**
 * Interface pour le mapper utilisateur.
 * Définit les méthodes de conversion entre Entity et DTO.
 */
public interface IUserMapper {

    /**
     * Convertit une entité User en UserResponseDTO.
     * @param user l'entité utilisateur à convertir
     * @return le UserResponseDTO correspondant
     */
    UserResponseDTO toResponseDTO(User user);

    /**
     * Convertit un UserRequestDTO en entité User.
     * @param dto le UserRequestDTO à convertir
     * @return l'entité User correspondante
     */
    User toEntity(UserRequestDTO dto);

    /**
     * Met à jour une entité User existante avec les données d'un UserRequestDTO.
     * @param user l'entité User à mettre à jour
     * @param dto le UserRequestDTO contenant les nouvelles données
     */
    void updateEntityFromDTO(User user, UserRequestDTO dto);
}
