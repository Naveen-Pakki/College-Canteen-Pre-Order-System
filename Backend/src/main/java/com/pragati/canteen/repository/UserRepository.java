package com.pragati.canteen.repository;

import com.pragati.canteen.entity.User;
import com.pragati.canteen.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for User persistence.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByRegistrationId(String registrationId);

    Optional<User> findByRegistrationIdIgnoreCase(String registrationId);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByRegistrationIdIgnoreCaseOrEmailIgnoreCase(String registrationId, String email);

    boolean existsByRegistrationIdIgnoreCase(String registrationId);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(Role role);
}

