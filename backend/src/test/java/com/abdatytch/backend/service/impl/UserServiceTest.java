package com.abdatytch.backend.service.impl;

import com.abdatytch.backend.enums.UserStatus;
import com.abdatytch.backend.mapper.IUserMapper;
import com.abdatytch.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires de UserService : les statistiques utilisent désormais des
 * SELECT COUNT (countByStatus) plutôt qu'un findAll().filter() en mémoire.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock IUserMapper userMapper;
    @Mock PasswordEncoder passwordEncoder;

    UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, userMapper, passwordEncoder);
    }

    @Test
    void getUserStatistics_aggregatesViaCountQueries_noFullScan() {
        when(userRepository.count()).thenReturn(Mono.just(10L));
        when(userRepository.countByStatus(UserStatus.ACTIVE)).thenReturn(Mono.just(7L));
        when(userRepository.countByStatus(UserStatus.INACTIVE)).thenReturn(Mono.just(1L));
        when(userRepository.countByStatus(UserStatus.BANNED)).thenReturn(Mono.just(1L));
        when(userRepository.countByStatus(UserStatus.BLOCKED)).thenReturn(Mono.just(1L));

        StepVerifier.create(userService.getUserStatistics())
            .assertNext(stats -> {
                assertEquals(10L, stats.getTotalUsers().longValue());
                assertEquals(7L, stats.getTotalActiveUsers().longValue());
                assertEquals(1L, stats.getTotalInactiveUsers().longValue());
                assertEquals(1L, stats.getTotalBannedUsers().longValue());
                assertEquals(1L, stats.getTotalBlockedUsers().longValue());
            })
            .verifyComplete();

        // On ne charge plus toute la table en mémoire.
        verify(userRepository, never()).findAll();
    }
}
