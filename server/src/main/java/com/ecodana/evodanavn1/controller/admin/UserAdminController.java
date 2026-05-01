package com.ecodana.evodanavn1.controller.admin;

import com.ecodana.evodanavn1.model.Role;
import com.ecodana.evodanavn1.model.User;
import com.ecodana.evodanavn1.repository.RoleRepository;
import com.ecodana.evodanavn1.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Thymeleaf page controller for admin user management views.
 * REST API endpoints live in UserAdminApiController.
 */
@Controller
@RequestMapping("/admin/users")
public class UserAdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    public String getUserManagementPage(HttpSession session, Model model) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null || !userService.isAdmin(currentUser)) {
            return "redirect:/login";
        }
        List<User> users = userService.getAllUsersWithRole();
        List<Role> roles = roleRepository.findAll();
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("users", users);
        model.addAttribute("roles", roles);
        model.addAttribute("totalUsers", users.size());
        model.addAttribute("activeUsers", users.stream().filter(u -> u.getStatus() == User.UserStatus.Active).count());
        model.addAttribute("inactiveUsers", users.stream().filter(u -> u.getStatus() == User.UserStatus.Inactive).count());
        model.addAttribute("bannedUsers", users.stream().filter(u -> u.getStatus() == User.UserStatus.Banned).count());
        model.addAttribute("adminCount", users.stream().filter(u -> u.getRole() != null && "Admin".equals(u.getRole().getRoleName())).count());
        model.addAttribute("ownerCount", users.stream().filter(u -> u.getRole() != null && "Owner".equals(u.getRole().getRoleName())).count());
        model.addAttribute("customerCount", users.stream().filter(u -> u.getRole() != null && "Customer".equals(u.getRole().getRoleName())).count());
        return "admin/user-management";
    }

    @GetMapping("/detail/{id}")
    public String getUserDetailPage(@PathVariable String id, HttpSession session, Model model) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null || !userService.isAdmin(currentUser)) {
            return "redirect:/login";
        }
        User user = userService.findByIdWithRole(id);
        if (user == null) throw new NoSuchElementException("User not found: " + id);
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("user", user);
        return "admin/user-detail";
    }

    @GetMapping("/edit/{id}")
    public String getUserEditPage(@PathVariable String id, HttpSession session, Model model) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null || !userService.isAdmin(currentUser)) {
            return "redirect:/login";
        }
        User user = userService.findByIdWithRole(id);
        if (user == null) throw new NoSuchElementException("User not found: " + id);
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("user", user);
        model.addAttribute("roles", roleRepository.findAll());
        return "admin/user-edit";
    }

    @PostMapping("/ban")
    public String banUser(@RequestParam String userId, HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null || !userService.isAdmin(currentUser)) {
            return "redirect:/login";
        }
        if (currentUser.getId().equals(userId)) {
            return "redirect:/admin/dashboard?tab=users&error=Cannot+ban+your+own+account";
        }
        User user = userService.findById(userId);
        if (user == null) throw new NoSuchElementException("User not found: " + userId);
        user.setStatus(User.UserStatus.Banned);
        userService.save(user);
        return "redirect:/admin/dashboard?tab=users";
    }

    @PostMapping("/unban")
    public String unbanUser(@RequestParam String userId, HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null || !userService.isAdmin(currentUser)) {
            return "redirect:/login";
        }
        User user = userService.findById(userId);
        if (user == null) throw new NoSuchElementException("User not found: " + userId);
        user.setStatus(User.UserStatus.Active);
        userService.save(user);
        return "redirect:/admin/dashboard?tab=users";
    }
}
