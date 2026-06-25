package com.abdatytch.backend.mapper.impl;

import com.abdatytch.backend.dto.request.RegisterRequestDTO;
import com.abdatytch.backend.dto.response.AuthResponseDTO;
import com.abdatytch.backend.entity.User;
import com.abdatytch.backend.enums.UserStatus;
import com.abdatytch.backend.mapper.IAuthMapper;
import com.abdatytch.backend.utils.UsernameGenerator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Implémentation du mapper pour les DTOs d'authentification.
 * Convertit entre les entités et les DTOs d'authentification.
 */
@Component
public class AuthMapperImpl implements IAuthMapper {

    private final PasswordEncoder passwordEncoder;

    public AuthMapperImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User toUserFromRegisterRequest(RegisterRequestDTO registerRequest) {
        User user = new User();
        user.setUsername(UsernameGenerator.generateUsername(registerRequest.getFirstName(), registerRequest.getLastName()));
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setRole("USER");
        user.setStatus(UserStatus.INACTIVE);
        return user;
    }

    @Override
    public AuthResponseDTO toAuthResponse(User user, String accessToken, String refreshToken) {
        AuthResponseDTO response = new AuthResponseDTO();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        return response;
    }
}
